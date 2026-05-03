#!/usr/bin/env bash

set -xEeuo pipefail

GITMODULES=".gitmodules"
FEXT=".bak"
GITMODULES_BACKUP="${GITMODULES}${FEXT}"

function cleanup {
  echo "Cleaning the runner..."
  rm -f "$GITMODULES" "$GITMODULES_BACKUP"
  git restore "$GITMODULES"
  echo "Done!"
}

trap cleanup EXIT

function submodule_workaround {
  if [ -z "${GITHUB_TOKEN:-}" ]; then
    echo "GITHUB_TOKEN is empty!"
    exit 1
  fi

  echo "Monkey patching..."
  sed -i"$FEXT" "s|url = \.\./|url = https://oauth2:${GITHUB_TOKEN}@github.com/cursor-js/|" "$GITMODULES"
  sed -i"$FEXT" "s|url = https://github.com/|url = https://oauth2:${GITHUB_TOKEN}@github.com/|" "$GITMODULES"
  echo "Done!"

  echo "Synchronising submodules' remote URL configuration..."
  git submodule sync
  echo "Done!"

  echo "Cleaning cached submodule directories..."
  git config --file .gitmodules --get-regexp path | awk '{print $2}' | while read -r dir; do
    if [ -d "$dir" ]; then
      echo "  Removing $dir"
      rm -rf "$dir"
    fi
  done
  echo "Done!"

  echo "Updating the registered submodules to match what the superproject expects..."
  git submodule update --init --force --recursive --jobs "$(getconf _NPROCESSORS_ONLN)"
  echo "Done!"
}

submodule_workaround
