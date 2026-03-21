FROM kalilinux/kali-rolling

RUN apt-get update && apt-get install -y --no-install-recommends \
    sqlmap \
    nikto \
    hydra \
    curl \
    wget \
    nmap \
    python3 \
    python3-pip \
    python3-venv \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /attacks

RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install flask requests

COPY scripts/ /attacks/scripts/
RUN chmod +x /attacks/scripts/*.sh

COPY attack_api.py /attacks/attack_api.py

EXPOSE 8888

CMD ["python3", "/attacks/attack_api.py"]
