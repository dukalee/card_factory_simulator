from dataclasses import dataclass, field


@dataclass
class BaseMachine:
    name: str
    status: int = 0
    fb: int = 1
    oil: int = 1
    process_time: int = 5
    password: str = ""
