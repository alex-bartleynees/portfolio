---
title: "Deploying a Kubernetes Cluster with Kubeadm"
pubDate: "January 11 2025"
heroImage: "/images/kubernetes-logo.png"
author: "Alex Bartley Nees"
---

This blog post describes my experience deploying a Kubernetes cluster from scratch with kubeadm. I decided to do this because it would be a good way to learn Kubernetes, and I also wanted to easily deploy my blog site and personal projects. I decided to go with a single node cluster to keep things simpler to start with as I learnt and because this was sufficient for my blog and a few personal projects.

### What is Kubernetes?

Kubernetes is an open-source container orchestrator, simply it orchestrates your containers. We can easily spin up containers with Docker, but this isn't enough for a production system. What happens if a container suddenly stops working, how do we deal with health monitoring, and how do we deploy new versions of our application with zero downtime? This is an example of what Kubernetes helps solve and a whole lot more. Kubernetes is usually abbreviated to K8s. Typically we interact with K8s through the command line with a tool called KubeCTL. Applications and services are defined as YAML files and are usually applied through CI/CD pipelines. Kubernetes involves writing a lot of YAML! Kubernetes is declarative, so we tell Kubernetes what we want our applications to look like and Kubernetes will attempt to match the running environment with our desired state. For example, if we want 5 instances of our application running, and Kubernetes only sees 3, it will automatically spin up another 2 containers.

### What is Kubeadm?

Kubeadm is a tool that helps us to create a minimum viable Kubernetes cluster that conforms to best practices. Kubeadm is intentionally minimal to provide core cluster bootstrapping, so we also need to provide and configure networking, a container runtime and storage solutions by ourselves. I decided to use Kubeadm as the hands-on approach made it a great learning tool.

### Using Ansible

I wanted to deploy my blog site and some personal projects to a VPS (Virtual private server) running on a single node K8s cluster. Setting up the cluster involved a lot of steps which would be time-consuming to remember and configure manually. I decided to use Ansible to automate the process of configuring the VPS and setting up the cluster as it helped to document every step and make the process repeatable while being easier to mantain and manage than shell scripts. Ansible uses what it calls "playbooks" - YAML files that declare configurations and define tasks to be executed. This allowed me to break down the cluster setup into clear, logical stages: infrastructure preparation, Kubernetes installation, networking setup, and add-on deployments. I could then easily run this against my VPS and have everything up and running.

### Prerequisites

The first stage of the process was setting up all the prerequisites needed for the cluster. I decided to use Rocky Linux on my VPS as I was a big fan of Fedora and wanted enterprise-grade stability. The first step was setting up the firewall to open the required ports for Kubernetes:

- 6443 for the Kubernetes API server
- 2379-2380 for etcd
- 10250 for Kubelet API
- Port range 30000-32767 for NodePort Services
- 80/443 for HTTP/HTTPS traffic

The next step was installing Kubernetes components and setting up the container runtime. First, I added the Kubernetes repository to DNF (Rocky Linux's package manager) to install three essential tools:

- kubelet: The primary node agent that runs on each node, ensuring containers are running in a pod
- kubeadm: The tool we'll use to bootstrap the cluster
- kubectl: The command-line tool for interacting with the cluster

For the container runtime, I installed:

- containerd v2.0.0: The container runtime engine
- runc v1.1.3: The container runtime specification
- CNI plugins: For container networking

An important step was making sure that specific kernel parameters were configured for networking to work correctly. I needed to enable:

- IP forwarding: Allows containers to communicate with each other across nodes
- Bridge networking: Ensures iptables rules are enforced on bridge traffic for both IPv4 and IPv6, which is essential for Kubernetes network policies and security.

Without these configurations, pod-to-pod communication and network policies wouldn't work properly.

### Initialising the Kubernetes Control Plane

After installing the prerequisites, the next step was initializing the Kubernetes control plane. The control plane manages the overall state of the cluster and when we run `kubeadm init`, it sets up these components:

- kube-api server: This is the front door to Kubernetes. Everything (kubectl commands, the scheduler, etc.) talks to the API server first.
- etcd: A database that stores all cluster data in a key-value store.
- kube-scheduler: Decides which node should run your pods based on available resources and constraints.
- kube-controller manager: Handles cluster-wide operations like reacting when a pod crashes or scaling your applications.

In a production environment, you would typically have multiple control planes for high availability. However, since this is a single-node cluster for running my blog and personal projects, one control plane node is sufficient.

By default, Kubernetes won't run regular workloads (like your applications) on control plane nodes. This is a safety feature - in a multi-node cluster, you want to keep your control plane dedicated to managing the cluster rather than running applications.

However, since I'm running a single-node cluster, I needed to change this behavior. If I didn't, I wouldn't be able to run my blog or other applications because there would be no worker nodes to run them on! This is done by removing what Kubernetes calls a "taint" from the control plane node:

`kubectl taint nodes --all node-role.kubernetes.io/control-plane-`

### Kubernetes Networking

In a Kubernetes cluster, the pods need to communicate with each other. However, Kubernetes doesn't handle pod networking by itself. We need to install a Container Network Interface (CNI) plugin. For this, I decided on Flannel because:

- It's one of the simplest networking solutions
- Works well for small clusters
- Sets up a flat network where every pod can talk to every other pod
- Uses a default network range of 10.244.0.0/16 for pod IPs

To install Flannel on our cluster we download the latest Flannel manifest from Github and apply it to our cluster using kubectl:
`kubectl apply -f /tmp/kube-flannel.yml`

### Installing Helm

To make deploying applications to our cluster easier, I installed Helm, Helm is a package manager for Kubernetes. It uses "charts" which are packages of pre-configured Kubernetes resources which is what I used to package my blog and personal projects.

The installation process involves:

- Downloading the Helm binary for Linux
- Installing it to /usr/local/bin so it's available in our PATH
- Adding some common Helm repositories:

  - The stable repository for official charts
  - Bitnami's repository which has a great collection of well-maintained charts

This means that instead of managing Kubernetes YAML files manually, we can use Helm charts that handle the configuration and make deploying complex applications easier.

### Installing NGINX Ingress Controller

To allow external traffic into our cluster, we need an Ingress Controller. I chose the NGINX Ingress Controller, which acts as a reverse proxy and load balancer. This lets us expose our applications to the internet and route traffic. For example with the ingress controller, I can route traffic to my portfolio and blog site at alexbartleynees.com as well as a personal project at a subdomain.

I installed it using Helm with some specific configurations:

- Set up as a DaemonSet to ensure it runs on our node. A DaemonSet ensures that all or some nodes run a copy of a pod.
- Resource limits to prevent it from using too much CPU and memory
- Configured timeouts and body size limits for requests
- Used host networking mode since this is a single-node setup

### TLS Certificates with cert-manager

To secure traffic to our cluster with HTTPS, we need TLS certificates. I installed cert-manager to automate certificate management. Cert-manager can automatically obtain and renew certificates from Let's Encrypt.

I also installed Reflector alongside cert-manager. This helps manage certificates across different namespaces - when cert-manager obtains a certificate, Reflector can automatically copy it to other namespaces where it's needed. For example, I have multiple namespaces in my cluster for my blog site and different projects. Reflector makes it easy to copy the certificate to namespaces where it is needed.

This means that once configured, cert-manager will automatically handle all our HTTPS certificates, and Reflector ensures they're available wherever needed in our cluster.

### Storage with OpenEBS

To provide persistent storage for our applications, we need a storage solution. I chose OpenEBS because it can provide storage directly from the node's local disk, which works well for a single-node setup.

I installed OpenEBS using Helm and configured it to use the local-hostpath storage class. This means when an application needs storage, OpenEBS will automatically create it using the node's local disk space. I set this as the default storage class so any application requesting storage will automatically use it.

I needed this for running an instance of PostgresSQL on my cluster.

### Deploying Applications with Helm

After setting up all the cluster components, I used Helm to deploy my applications. I store my Helm charts in Docker Hub, which makes it easy to version and distribute them. Each application (like my blog) has its own Helm chart that defines how it should run in Kubernetes.
The deployment process:

Each application gets its own namespace
Configuration values are stored in separate files
Helm handles installing and upgrading the applications
Can easily see all deployed applications with helm ls

This made it simple to manage deployments of my blog and other projects to the cluster.

### Continuous Deployment with GitHub Actions

To make deploying to my cluster easy, I use GitHub Actions. When I push changes to the main branch, GitHub Actions automatically:

- Builds the Docker image for my application
- Pushes it to Docker Hub with a unique tag
- Packages the Helm chart and pushes it to Docker Hub
- Deploys the updated application to my cluster

This means whenever I make changes to my code, they're automatically deployed to my cluster without any manual steps. The workflow uses secrets stored in GitHub to securely access Docker Hub and my Kubernetes cluster.

### Conclusion

Setting up a Kubernetes cluster from scratch with kubeadm was a great learning experience. I now have a better understanding of how Kubernetes works under the hood - from container networking to storage and ingress configurations. While it took more work than using a managed service, the knowledge gained was invaluable.
The cluster is now successfully running my blog and several personal projects with:

NGINX Ingress handling incoming traffic
cert-manager automatically managing HTTPS certificates
OpenEBS providing storage for databases
GitHub Actions automating all deployments

Using Ansible to automate the setup means I can easily recreate the cluster if needed, and the experience has made me much more confident in working with Kubernetes.

All the Ansible playbooks used to set up this cluster are available in my GitHub repository: <a class="link underline" href="https://github.com/alex-bartleynees/k8s-ansible">repo</a>
