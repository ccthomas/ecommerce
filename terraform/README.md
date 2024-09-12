# Terraform

For useage outside of docker.

[Install Terraform](https://developer.hashicorp.com/terraform/install)

Run Terraform to configure AWS environment. Note for local env, we do not need to worry about IAM roles and permissons.

**Terraform state tracking is backed by S3. Ensure the bucket is created in the targeted aws region.**
**Note: S3 Backed state is hardcoded**

```bash
terraform init
terraform plan
terraform apply --auto-approve
```

Optionally add flag `-chdir=./terraform` to run from root of project.
