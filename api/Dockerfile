FROM python:3.11-slim

WORKDIR /api

RUN mkdir -p /api/src

RUN mkdir -p /api/data

RUN mkdir -p /api/input

RUN mkdir -p /api/logs

ENV TZ="Asia/Jakarta"

COPY ./version.txt /api/version.txt

COPY ./requirements.txt /api/requirements.txt

RUN pip install --no-cache-dir -r /api/requirements.txt

COPY ./src /api/src

CMD ["fastapi", "run", "src/app.py", "--port", "80"]

