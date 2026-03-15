import os
import sys
import importlib.util
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print(app.title + " ready", flush=True)
    yield
    # Shutdown
    print(app.title + " shutdown", flush=True)

app = FastAPI(title="PyServer", lifespan=lifespan)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "message": "Request validation failed",
            "errors": exc.errors(),
        },
    )

# directory of pyserver.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# routes folder
ROUTES_DIR = os.path.join(BASE_DIR, "routes")
sys.path.insert(0, ROUTES_DIR)

# dynamically import each Python file in routes
for filename in os.listdir(ROUTES_DIR):
    if not filename.endswith(".py") or filename.startswith("_"):
        continue

    module_name = filename[:-3]
    module_path = os.path.join(ROUTES_DIR, filename)
    spec = importlib.util.spec_from_file_location(module_name, module_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    if hasattr(module, "router"):
        app.include_router(module.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8120, log_level="debug")
