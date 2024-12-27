from pydantic import BaseModel

class HistoricalEvent(BaseModel):
    id: str
    title: str
    year: int
    date: str
    country: str
    description: str
    longDescription: str
    imagePrompt: str

class EventCollection(BaseModel):
    events: list[HistoricalEvent]