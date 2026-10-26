#!/bin/sh
set -eu

sudo chown -R "$(id -un):$(id -gn)" node_modules
bun install --frozen-lockfile
