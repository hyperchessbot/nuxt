FROM gitpod/workspace-full

# Install custom tools, runtime, etc.
RUN npm install -g typescript
RUN npm install -g rollup
