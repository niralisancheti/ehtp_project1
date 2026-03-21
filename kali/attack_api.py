from flask import Flask, jsonify, request
import subprocess
import threading
import uuid
import os
import time

app = Flask(__name__)
TARGET = os.environ.get("TARGET_URL", "http://backend:5001")
jobs = {}


def wait_for_backend():
    """Wait until the backend is reachable before accepting attack requests."""
    import requests
    for i in range(30):
        try:
            requests.get(f"{TARGET}/api/attacks", timeout=3)
            print(f"[+] Backend reachable at {TARGET}")
            return True
        except Exception:
            print(f"[*] Waiting for backend... ({i+1}/30)")
            time.sleep(2)
    print("[-] Backend not reachable after 60 seconds")
    return False


@app.route("/health")
def health():
    return jsonify({
        "status": "ok",
        "target": TARGET,
        "tools": ["sqlmap", "nikto", "hydra", "curl", "nmap"],
        "active_jobs": len([j for j in jobs.values() if j["status"] == "running"])
    })


@app.route("/run/<attack_type>", methods=["POST"])
def run_attack(attack_type):
    script_map = {
        "sqli": "/attacks/scripts/sqli_attack.sh",
        "xss": "/attacks/scripts/xss_attack.sh",
        "cmdi": "/attacks/scripts/cmdi_attack.sh",
        "csrf": "/attacks/scripts/csrf_attack.sh",
    }

    if attack_type not in script_map:
        return jsonify({"error": f"Unknown attack type: {attack_type}"}), 400

    job_id = str(uuid.uuid4())[:8]
    jobs[job_id] = {
        "job_id": job_id,
        "status": "running",
        "attack_type": attack_type,
        "output": "",
        "lines": [],
        "errors": "",
        "start_time": time.time()
    }

    def execute():
        try:
            proc = subprocess.Popen(
                ["bash", script_map[attack_type], TARGET],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1
            )
            for line in proc.stdout:
                line = line.rstrip("\n")
                jobs[job_id]["lines"].append(line)
                jobs[job_id]["output"] += line + "\n"
            proc.wait(timeout=120)
            stderr = proc.stderr.read()
            jobs[job_id]["status"] = "completed"
            jobs[job_id]["errors"] = stderr
            jobs[job_id]["return_code"] = proc.returncode
        except subprocess.TimeoutExpired:
            proc.kill()
            jobs[job_id]["status"] = "timeout"
            jobs[job_id]["errors"] = "Attack timed out after 120 seconds"
        except Exception as e:
            jobs[job_id]["status"] = "error"
            jobs[job_id]["errors"] = str(e)
        jobs[job_id]["end_time"] = time.time()
        jobs[job_id]["duration"] = round(jobs[job_id]["end_time"] - jobs[job_id]["start_time"], 2)

    thread = threading.Thread(target=execute, daemon=True)
    thread.start()

    return jsonify({"job_id": job_id, "status": "running", "attack_type": attack_type})


@app.route("/status/<job_id>")
def job_status(job_id):
    if job_id not in jobs:
        return jsonify({"error": "Job not found"}), 404
    job = jobs[job_id]
    # Support partial reads: client sends ?from_line=N to get only new lines
    from_line = request.args.get("from_line", 0, type=int)
    return jsonify({
        "job_id": job["job_id"],
        "status": job["status"],
        "attack_type": job["attack_type"],
        "lines": job["lines"][from_line:],
        "total_lines": len(job["lines"]),
        "errors": job.get("errors", ""),
        "duration": job.get("duration"),
        "output": job.get("output", "")
    })


@app.route("/jobs")
def list_jobs():
    return jsonify({"jobs": list(jobs.values())})


if __name__ == "__main__":
    wait_for_backend()
    app.run(host="0.0.0.0", port=8888)
