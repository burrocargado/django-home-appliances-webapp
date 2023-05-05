from uvicorn.workers import UvicornWorker


class MyUvicornWorker(UvicornWorker):
    CONFIG_KWARGS = {"loop": "auto", "http": "auto", "root_path": "/hawebapp/"}
