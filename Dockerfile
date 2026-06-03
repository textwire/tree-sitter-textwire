FROM gcc:15-trixie

RUN apt update && \
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json .

RUN npm install && npm cache clean --force

COPY . .

CMD ["bash"]
