<#
.SYNOPSIS
Helper script for managing the local Kafka infrastructure.

.DESCRIPTION
Provides shortcuts for starting, stopping, resetting, and interacting with the local
Kafka cluster and Redpanda Console.

.PARAMETER Command
The command to run. Valid options: start, stop, reset, status, topics, produce, consume.

.EXAMPLE
.\kafka-dev.ps1 start
Starts the Kafka cluster in the background.

.EXAMPLE
.\kafka-dev.ps1 produce user-events '{"userId": "123", "action": "product_view", "eventId": "abc-123"}'
Produces a JSON message to the user-events topic.
#>

param (
    [Parameter(Mandatory=$true, Position=0)]
    [ValidateSet('start', 'stop', 'reset', 'status', 'topics', 'produce', 'consume')]
    [string]$Command,

    [Parameter(Mandatory=$false, Position=1)]
    [string]$Arg1,

    [Parameter(Mandatory=$false, Position=2)]
    [string]$Arg2
)

$ComposeFile = "docker\compose\docker-compose.infra.yml"

switch ($Command) {
    'start' {
        Write-Host "Starting Kafka infrastructure..." -ForegroundColor Green
        docker compose -f $ComposeFile up -d
        Write-Host "Kafka is running. Access Redpanda Console at http://localhost:8089" -ForegroundColor Cyan
    }
    'stop' {
        Write-Host "Stopping Kafka infrastructure..." -ForegroundColor Yellow
        docker compose -f $ComposeFile down
    }
    'reset' {
        Write-Host "Resetting Kafka infrastructure (destroying all volumes)..." -ForegroundColor Red
        docker compose -f $ComposeFile down -v
        Write-Host "Kafka data has been wiped." -ForegroundColor Green
    }
    'status' {
        docker compose -f $ComposeFile ps
    }
    'topics' {
        Write-Host "Listing Kafka topics..." -ForegroundColor Green
        docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:29092 --list
    }
    'produce' {
        if (-not $Arg1 -or -not $Arg2) {
            Write-Host "Usage: .\kafka-dev.ps1 produce <topic_name> '<json_payload>'" -ForegroundColor Red
            exit 1
        }
        $Topic = $Arg1
        $Message = $Arg2
        Write-Host "Producing message to $Topic..." -ForegroundColor Green
        $Message | docker exec -i kafka /opt/kafka/bin/kafka-console-producer.sh --bootstrap-server localhost:29092 --topic $Topic
    }
    'consume' {
        $Topic = if ($Arg1) { $Arg1 } else { "user-events" }
        Write-Host "Consuming messages from $Topic (Ctrl+C to exit)..." -ForegroundColor Green
        docker exec -it kafka /opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:29092 --topic $Topic --from-beginning
    }
}
