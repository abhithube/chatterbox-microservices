FROM gitpod/workspace-full

RUN brew install terraform

COPY nginx.conf /etc/nginx/nginx.conf