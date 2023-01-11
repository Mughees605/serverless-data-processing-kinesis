# Serverless Data Processing on AWS

![Architecture Diagram](images/serverless-kinesis.png?raw=true "Architecture Diagram")

This pattern creates an AWS Kinesis Data Stream, a stream consumer, and an AWS Lambda function. When data is added to the stream, the Lambda function is invoked via a consumer.

Important: this application uses various AWS services and there are costs associated with these services after the Free Tier usage - please see the [AWS Pricing page](https://aws.amazon.com/pricing/) for details. You are responsible for any AWS costs incurred. No warranty is implied in this example.

- [Create an AWS account](https://portal.aws.amazon.com/gp/aws/developer/registration/index.html) if you do not already have one and log in. The IAM user that you use must have sufficient permissions to make necessary AWS service calls and manage AWS resources.
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) installed and configured
- [Git Installed](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Serverless Framework](https://www.serverless.com/framework/docs/providers/aws/guide/intro)

## Deployment Instructions

1. Create a new directory, navigate to that directory in a terminal and clone the GitHub repository:
   ```
   git clone https://github.com/Mughees605/serverless-data-processing-kinesis.git
   ```
1. Change directory to the pattern directory:
   ```
   cd serverless-data-processing-kinesis
   ```
1. From the command line, use serverless framework to deploy the AWS resources for the pattern as specified in the serverless.yml file:
   ```
   sls deploy
   ```

## Testing

1.  Setup AWS Cloud9 instance

1.  The modules utilize two command-line clients to simulate and display sensor data from the unicorns in the fleet. These are small
    programs written in the Go Programming Language. The below instructions in the Installation section walks through downloading pre-built binaries, but you can also download the source and build it manually:

    ### Installation

    1.  Switch to the tab where you have your Cloud9 environment opened.
    1.  Download and unpack the command line clients by running the following command in the Cloud9 terminal:

            ```
            curl -s https://data-processing.serverlessworkshops.io/client/client.tar | tar -xv
            ```

        This will unpack the consumer and producer files to your Cloud9 environment.

1.  Use the command-line producer to produce messages into the stream. In the terminal, run the producer to start emitting sensor data to the stream.
    ```
    ./producer -name Shadowfax -stream wildrydes -msgs 20
    ```
    The producer emits a message a second to the stream and prints a period to the screen.

1. Verify that the trigger is properly executing the Lambda function. View the metrics emitted by the function and inspect the output from the Lambda function.
1. Click on View logs in CloudWatch to explore the logs in CloudWatch for the log group /aws/lambda/WildRydesStreamProcessor
1. Using the AWS Management Console, query the DynamoDB table for data for a specific unicorn. Use the producer to create data from a distinct unicorn name and verify those records are persisted.

## Cleanup
