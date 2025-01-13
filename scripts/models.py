from pydantic import BaseModel

class HistoricalEvent(BaseModel):
    id: str
    title: str
    rank: int
    description: str
    longDescription: str
    imagePrompt: str

class EventCollection(BaseModel):
    events: list[HistoricalEvent]