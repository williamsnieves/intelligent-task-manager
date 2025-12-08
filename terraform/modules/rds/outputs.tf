output "endpoint" {
  description = "DocumentDB cluster endpoint"
  value       = aws_docdb_cluster.main.endpoint
}

output "reader_endpoint" {
  description = "DocumentDB cluster reader endpoint"
  value       = aws_docdb_cluster.main.reader_endpoint
}

output "connection_string" {
  description = "MongoDB connection string"
  value       = "mongodb://${aws_docdb_cluster.main.master_username}:${aws_docdb_cluster.main.master_password}@${aws_docdb_cluster.main.endpoint}:27017/?retryWrites=false"
  sensitive   = true
}

output "cluster_id" {
  description = "DocumentDB cluster ID"
  value       = aws_docdb_cluster.main.id
}
