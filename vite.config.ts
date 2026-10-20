name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]

  # Cho phép chạy thủ công từ tab Actions
  workflow_dispatch:

# Cấp quyền cho GITHUB_TOKEN để deploy lên Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Cho phép chạy 1 deployment tại 1 thời điểm
concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Build project
        run: bun run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
