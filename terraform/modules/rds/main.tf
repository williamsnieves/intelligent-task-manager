# ================================
# RDS Module - DocumentDB (MongoDB-compatible)
# Using smallest instance for free tier eligibility
# ================================

# DB Subnet Group
resource "aws_docdb_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-docdb-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.project_name}-${var.environment}-docdb-subnet-group"
  }
}

# DocumentDB Cluster Parameter Group
resource "aws_docdb_cluster_parameter_group" "main" {
  family      = "docdb5.0"
  name        = "${var.project_name}-${var.environment}-docdb-params"
  description = "DocumentDB cluster parameter group"

  parameter {
    name  = "tls"
    value = "disabled"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-docdb-params"
  }
}

# DocumentDB Cluster
resource "aws_docdb_cluster" "main" {
  cluster_identifier              = "${var.project_name}-${var.environment}-docdb"
  engine                          = "docdb"
  master_username                 = var.db_username
  master_password                 = var.db_password
  backup_retention_period         = 1
  preferred_backup_window         = "03:00-04:00"
  preferred_maintenance_window    = "mon:04:00-mon:05:00"
  skip_final_snapshot            = true
  db_subnet_group_name           = aws_docdb_subnet_group.main.name
  vpc_security_group_ids         = [var.db_security_group]
  db_cluster_parameter_group_name = aws_docdb_cluster_parameter_group.main.name
  enabled_cloudwatch_logs_exports = ["audit", "profiler"]

  tags = {
    Name = "${var.project_name}-${var.environment}-docdb"
  }
}

# DocumentDB Instance (smallest instance: db.t3.medium)
# Note: DocumentDB doesn't have a true free tier, but this is the smallest instance
resource "aws_docdb_cluster_instance" "main" {
  identifier         = "${var.project_name}-${var.environment}-docdb-instance"
  cluster_identifier = aws_docdb_cluster.main.id
  instance_class     = "db.t3.medium"

  tags = {
    Name = "${var.project_name}-${var.environment}-docdb-instance"
  }
}

# Alternative: Use MongoDB Atlas Free Tier (M0) instead
# This is recommended for true zero-cost deployment
# Configure via MongoDB Atlas UI and use connection string in environment variables
