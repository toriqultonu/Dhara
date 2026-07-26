#!/usr/bin/env bash
# Regenerate Python gRPC stubs from proto/rag_service.proto into app/generated/.
#
# The proto contract is shared with the Spring Boot backend
# (backend/src/main/proto/rag_service.proto) — keep both files identical.
# Run this script from the rag-service directory after any proto change.
set -euo pipefail
cd "$(dirname "$0")/.."

uv run python -m grpc_tools.protoc \
  -Iproto \
  --python_out=app/generated \
  --pyi_out=app/generated \
  --grpc_python_out=app/generated \
  proto/rag_service.proto

# grpc_tools emits a bare `import rag_service_pb2`, which breaks when the stubs
# live inside the `app.generated` package. Rewrite it to an absolute package import.
sed -i 's/^import rag_service_pb2 as rag__service__pb2$/from app.generated import rag_service_pb2 as rag__service__pb2/' \
  app/generated/rag_service_pb2_grpc.py

echo "Stubs regenerated in app/generated/."
