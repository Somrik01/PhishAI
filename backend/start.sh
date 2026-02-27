#!/usr/bin/env bash

export OMP_NUM_THREADS=1
export OPENBLAS_NUM_THREADS=1
export MKL_NUM_THREADS=1

uvicorn main:app --host 0.0.0.0 --port 10000