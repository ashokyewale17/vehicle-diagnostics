# Vehicle_diagostics_app

## Deployment (EC2 + Docker Compose)

This repo includes a Dockerfile, an Nginx config, a docker-compose.yml and a GitHub Actions workflow to build/push the image and deploy to an EC2 host.

Required GitHub repository secrets (Settings → Secrets → Actions):

- REGISTRY: Docker registry (e.g., ghcr.io or your registry host)
- GHCR_TOKEN: Personal access token or registry token for pushing images
- IMAGE_NAME: repository/image name (e.g., myorg/vehicle-diagnostics)
- SSH_PRIVATE_KEY: Private SSH key for the EC2 user (keep secure)
- SSH_HOST: IP or hostname of your EC2 instance
- SSH_USER: SSH username (e.g., ec2-user, ubuntu)

How the workflow works:

1. On push to main, Actions builds and pushes a Docker image to the registry.
2. The workflow SSHs into your EC2 host, writes a docker-compose.yml and nginx config under ~/deploy, pulls the new image and restarts services.

Notes & security:

- Store secrets in GitHub Secrets. Do NOT commit private keys or credentials in the repo.
- Ensure your EC2 instance has Docker and docker-compose installed and the SSH public key corresponding to `SSH_PRIVATE_KEY` in `~/.ssh/authorized_keys` for `SSH_USER`.
