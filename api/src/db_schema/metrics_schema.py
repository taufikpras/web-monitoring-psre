
class Metrics_Schema():
    point:str
    fields: tuple[str,float]
    tags: tuple[str,str]

    def __init__(self, point):
        self.point = point
        self.fields = {}
        self.tags = {}

    def add_fields(self,key:str,value:float):
        self.fields[key] = value

    def add_tags(self,key:str,value:float):
        self.tags[key] = value

def set_metrics(point_:str, fields_:tuple, tags_:tuple):
    return Metrics_Schema(point = point_,
                   fields = fields_,
                   tags = tags_)