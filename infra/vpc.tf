data "aws_vpc" "main" {
  default = true
}

data "aws_subnet_ids" "main" {
  vpc_id = data.aws_vpc.main.id
}

data "aws_subnet" "main" {
  for_each = data.aws_subnet_ids.main.ids
  id       = each.value
}
