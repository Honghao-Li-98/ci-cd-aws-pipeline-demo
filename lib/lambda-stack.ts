import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Runtime, Code } from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export class MyLambdaStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    stageName: string,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);
    new NodejsFunction(this, "LambdaFunction", {
      runtime: Runtime.NODEJS_18_X, //using node for this, but can easily use python or other
      handler: "handler",
      entry: path.join(__dirname, "./lambda/handler.ts"),
      environment: { stageName: stageName }, //inputting stagename
    });
  }
}
