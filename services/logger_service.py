import os
from datetime import datetime


class LoggerService:
    def __init__(self, result_dir: str):
        self.log_path = os.path.join(result_dir, "log.txt")
        self.action_count: int = 0

    def reset_count(self):
        self.action_count = 0

    def _now(self) -> str:
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def _write(self, line: str):
        os.makedirs(os.path.dirname(self.log_path), exist_ok=True)
        with open(self.log_path, "a", encoding="utf-8") as f:
            f.write(line)

    def write_process(self, machine_name: str, start_time: float, end_time: float):
        start_str = datetime.fromtimestamp(start_time).strftime("%Y-%m-%d %H:%M:%S")
        end_str = datetime.fromtimestamp(end_time).strftime("%Y-%m-%d %H:%M:%S")
        self._write(f"PROCESS: {machine_name} | {start_str} | {end_str}\n")

    def write_error(self, machine_name: str):
        self._write(f"ERROR: {machine_name} | {self._now()}\n")

    def write_start(self):
        self._write(f"START | {self._now()}\n")

    def write_stop(self):
        self._write(f"STOP | {self._now()}\n")

    def write_pw_fail(self, machine_name: str):
        self._write(f"PW FAIL: {machine_name} | {self._now()}\n")

    def write_pw_success(self, machine_name: str):
        self.action_count += 1
        self._write(f"PW SUCCESS: {machine_name} | {self._now()}\n")

    def write_fix(self, machine_name: str):
        self.action_count += 1
        self._write(f"FIX: {machine_name} | {self._now()}\n")

    def write_oil(self, machine_name: str):
        self.action_count += 1
        self._write(f"OIL: {machine_name} | {self._now()}\n")

    def write_control(self, machine_name: str, button: str):
        self.action_count += 1
        self._write(f"FIX: {machine_name} | {self._now()} | {button}\n")

    def write_card_created(self):
        self._write(f"CARD CREATED | {self._now()}\n")
