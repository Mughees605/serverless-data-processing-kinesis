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

1.  Verify that the trigger is properly executing the Lambda function. View the metrics emitted by the function and inspect the output from the Lambda function.
1.  Click on View logs in CloudWatch to explore the logs in CloudWatch for the log group /aws/lambda/WildRydesStreamProcessor
1.  Using the AWS Management Console, query the DynamoDB table for data for a specific unicorn. Use the producer to create data from a distinct unicorn name and verify those records are persisted.

##  Error Handling with Retry Settings

1. AWS Lambda can reprocess batches of messages from Kinesis Data Streams when an error occurs in one of the items in the batch. You can configure the number of retries by configuring Retry attempts and/or Maximum age of record. The batch will be retried until the number of retry attempts or until the expiration of the batch. You can also configure On-failure destination which will be used by Lambda to send metadata of your failed invocation. You can send this metadata of the failed invocation to either an Amazon SQS queue or an Amazon SNS topic. Typically there are two kinds of errors in the data stream. One category belongs to transient errors which are temporary in nature and are successfully processed with retry logic. Second category belongs to Poison Pill (either data quality / data that generates an exception in Lambda code) which are permanent in nature. In this case Lambda retries for the configured retry attempts and then discards the records to the On-failure destination.
1. To test error handling with retry setting set bisectBatchOnFunctionError to false.
1. In the logs you can observe that, there will be error and the same batch will be retried twice ( as we configured retry-attempts to 2) 

##  Error Handling with Bisect On Batch settings
1.  To test error handling with retry setting set bisectBatchOnFunctionError to true.
1.  Insert data into Kinesis Data Stream by running producer binary.
    ```
    ./producer -name Shadowfax -stream wildrydes -msgs 20
    ```
1. Click on View logs in CloudWatch to explore the logs in CloudWatch for the log group /aws/lambda/WildRydesStreamProcessor
1. In the logs you can observe that, there will be error and the same batch will be split into two halves and processed. This splitting continues recursively until there is a single item or messages are processed successfully. 

## Tumbling Windows
1. The tumbling window feature allows a streaming data source to pass state between multiple Lambda invocations. During the window, a state is passed from one invocation to the next, until a final invocation at the end of the window. This allows developers to calculate aggregates in near-real time, and makes it easier to calculate sums, averages, and counts on values across multiple batches of data. This feature provides an alternative way to build analytics in addition to services like Amazon Kinesis Data Analytics.
1. To test tumbling window, insert data into Kinesis Data Stream by running producer binary.
    ```
    ./producer
    ```
1. Click on the Monitor tab. Next, click on View logs in CloudWatch to explore the logs in CloudWatch for the log group /aws/lambda/WildRydesAggregator.

## Error Handling with Checkpoint and Bisect On Batch

While Bisect On Batch is helpful in narrowing down to the problematic messages, it can result in processing previously successful messages more than once. With Checkpoint feature you can return the sequence identifier for the failed messages. This provides more precise control over how to choose to continue processing the stream. For example in a batch of 9 messages where the fifth message fails - Lambda process the batch of messages, items 1-9. The fifth message fails and the function returns the failed sequence identifier. The batch is only retried from message 5 to 9
