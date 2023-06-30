import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
  CodeBuildStep,
} from "aws-cdk-lib/pipelines";
import { ManualApprovalStep } from "aws-cdk-lib/pipelines";
import { MyPipelineAppStage } from "./stage";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { BuildSpec } from "aws-cdk-lib/aws-codebuild";

export class CiCdAwsPipelineDemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, "Pipeline", {
      pipelineName: "TestPipeline",
      synth: new CodeBuildStep("Synth", {
        input: CodePipelineSource.gitHub(
          "Honghao-Li-98/ci-cd-aws-pipeline-demo",
          "main"
        ), //Remember to change
        commands: ["npm ci", "npm run build", "npm run cdk synth"],
      }),
    });

    const testingStage = pipeline.addStage(
      new MyPipelineAppStage(this, "test", {
        env: { account: "106367372430", region: "us-east-1" },
      })
    );

    testingStage.addPre(
      new CodeBuildStep("Run Unit Tests", {
        commands: ["npm install", "npm test"],
        rolePolicyStatements: [
          new PolicyStatement({
            actions: ["sts:AssumeRole"],
            resources: ["*"],
            conditions: {
              StringEquals: {
                "iam:ResourceTag/aws-cdk:bootstrap-role": "lookup",
              },
            },
          }),
        ],
      })
    );
    testingStage.addPost(
      new ManualApprovalStep("Manual approval before production")
    );

    const prodStage = pipeline.addStage(
      new MyPipelineAppStage(this, "prod", {
        env: { account: "106367372430", region: "us-east-1" },
      })
    );
  }
}
