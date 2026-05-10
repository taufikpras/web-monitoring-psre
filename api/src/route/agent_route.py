from fastapi import APIRouter, HTTPException
import requests
from datetime import datetime
import pytz
import json
import redis
from src import parameters as params
import logging

logger = logging.getLogger(params.LOGGER_NAME)

router = APIRouter(prefix="/api/agent", tags=["Background Agent"])

FLOWER_API_URL = "http://flower:5555/api"

from src.celery import celery_app

@router.get("/status")
def get_agent_status():
    try:
        # Fetch workers directly from Celery broker (Redis) via inspect
        inspect = celery_app.control.inspect()
        stats = inspect.stats()
        
        workers = []
        if stats:
            for worker_name, worker_info in stats.items():
                workers.append({
                    "name": worker_name,
                    "status": "Online",
                    "concurrency": worker_info.get("pool", {}).get("max-concurrency", "Unknown")
                })

        # Get API Time
        tz = pytz.timezone(params.TZ)
        api_time = datetime.now(tz).isoformat()

        return {
            "workers": workers,
            "api_time": api_time,
            "timezone": params.TZ
        }

    except Exception as e:
        logger.error(f"Error fetching agent status: {str(e)}")
        # Provide fallback if Flower is unreachable
        tz = pytz.timezone(params.TZ)
        return {
            "workers": [],
            "api_time": datetime.now(tz).isoformat(),
            "timezone": params.TZ,
            "error": "Could not fetch worker status from Flower"
        }

@router.get("/tasks")
def get_agent_tasks():
    try:
        # Fetch tasks directly from the Redis broker/backend
        r = redis.Redis(
            host=params.REDIS_URL,
            port=int(params.REDIS_PORT),
            password=params.REDIS_PASSWORD,
            db=0,
            decode_responses=True
        )
        
        # We find keys formatted like 'celery-task-meta-*' 
        task_keys = r.keys('celery-task-meta-*')
        
        # Limit to the most recent 100 or so to avoid huge payloads if many tasks exist
        task_keys = task_keys[:100]
        
        task_list = []
        for key in task_keys:
            data = r.get(key)
            if not data:
                continue
                
            task_data = json.loads(data)
            
            # Use extended info if available; else fallback
            state = task_data.get("status", "UNKNOWN")
            task_id = task_data.get("task_id", key.replace("celery-task-meta-", ""))
            
            # Basic timestamp parsing
            date_done_str = task_data.get("date_done")
            timestamp = 0
            if date_done_str:
                try:
                    # Parse ISO format from celery e.g., 2026-02-22T12:25:43.432883+07:00
                    dt = datetime.fromisoformat(date_done_str)
                    timestamp = dt.timestamp()
                except:
                    pass
            
            # Extract brief args info if available
            raw_name = task_data.get("name", "Celery Task")
            args_info = ""
            if "args" in task_data and task_data["args"]:
                try:
                    # Depending on serializer, args could be string repr or actual list
                    # if it's a list, we take the first element (which is the payload dict)
                    args = task_data["args"]
                    if isinstance(args, list) and len(args) > 0:
                        first_arg = args[0]
                        if isinstance(first_arg, dict):
                            # Try to extract short identifiable fields
                            # If task contains "notif", don't show URL
                            if "notif" in raw_name.lower():
                                pass # hide args per request
                            else:
                                url = first_arg.get("url", "")
                                if url:
                                    args_info = url
                                elif "cn" in first_arg:
                                    args_info = first_arg['cn']
                except:
                    pass
                    
            task_list.append({
                "task_id": task_id,
                "name": raw_name,
                "args_info": args_info,
                "state": state,
                "received": timestamp,
                "started": timestamp,
                "succeeded": timestamp if state == "SUCCESS" else None,
                "failed": timestamp if state == "FAILURE" else None,
                "worker": task_data.get("worker", "Unknown"), # Present if result_extended=True
                "runtime": 0
            })
            
        # Sort by most recently done
        task_list.sort(key=lambda x: x["received"] or 0, reverse=True)

        return {"tasks": task_list}
    except Exception as e:
        logger.error(f"Error fetching tasks from Redis Backend: {str(e)}")
        raise HTTPException(status_code=500, detail="Could not fetch tasks natively from background agent")
