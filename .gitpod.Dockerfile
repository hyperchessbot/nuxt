5 lines (4 sloc)  122 Bytes
   
FROM gitpod/workspace-full

# Install custom tools, runtime, etc.
RUN npm install -g typescript
RUN npm install -g rollup
