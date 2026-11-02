from dataclasses import dataclass
from machines.base_machine import BaseMachine


@dataclass
class LogoMachine(BaseMachine):
    name: str = "LogoMachine"
    loc: int = 1
