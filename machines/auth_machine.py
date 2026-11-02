from dataclasses import dataclass
from machines.base_machine import BaseMachine


@dataclass
class AuthMachine(BaseMachine):
    name: str = "AuthMachine"
    loc: int = 1
