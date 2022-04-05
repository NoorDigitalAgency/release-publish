import * as core from '@actions/core';
import * as github from '@actions/github';
import { create } from '@actions/artifact';
import { rmRF } from '@actions/io';
import { inspect as stringify } from 'util';
import { readFileSync, existsSync } from 'fs';

async function run(): Promise<void> {

  try {

    const token = core.getInput('token', { required: true });

    core.debug(`Token: '${token}'`);

    const stage = core.getInput('stage', { required: true });

    core.info(`Stage is: '${stage}'`);

    const artifactName = core.getInput('artifact_name');

    core.debug(`Artifact name: '${artifactName}'`);

    const octokit = github.getOctokit(token);

    const context = github.context;

    core.startGroup('GitHub Context');

    core.debug(stringify(context, { depth: 5 }));

    core.endGroup();

    const artifacts = (await octokit.rest.actions.listWorkflowRunArtifacts({ owner: context.repo.owner, repo: context.repo.repo, run_id: context.runId })).data.artifacts;

    core.startGroup('Artifacts');

    core.debug(`${stringify(artifacts, { depth: 5 })}`);

    core.endGroup();

    if (artifacts.every(artifact => artifact.name !== artifactName)) {

      throw new Error(`Artifact '${artifactName}' doesn't exist. Make sure the 'dawn' action is run before the 'dusk' action and they are pointing to the same artifact name.`);
    }

    const client = create();

    await client.downloadArtifact(artifactName);

    const file = `${artifactName}.json`;

    if (!existsSync(file)) {

      throw new Error(`Artifact file '${file}' doesn't exist.`);
    }

    core.debug(`Artifact file name: '${file}'`);

    const {version, previousVersion, reference} = JSON.parse(readFileSync(file).toString()) as {version: string; previousVersion: string; reference: string};

    rmRF(file).catch((error) => {

      core.warning(`File '${file} could not be removed.'`);

      core.startGroup('Artifact removal error');

      core.debug(`${stringify(error, { depth: 5 })}`);

      core.endGroup();
    });

    const branch = stage === 'alpha' ? 'develop' : stage === 'beta' ? 'release' : 'main';

    core.debug(`Branch: '${branch}'`);

    const prerelease = branch !== 'main';

    core.debug(`Prerelease: ${prerelease}`);

    const releaseNotes = (await octokit.rest.repos.generateReleaseNotes({ owner: context.repo.owner, repo: context.repo.repo, tag_name: version, target_commitish: reference, previous_tag_name: previousVersion })).data;

    core.startGroup('Release notes');

    core.debug(`${stringify(releaseNotes, { depth: 5 })}`);

    core.endGroup();

    await octokit.rest.repos.createRelease({ owner: context.repo.owner, repo: context.repo.repo, tag_name: version, target_commitish: reference, prerelease, generate_release_notes: false, ...releaseNotes });

  } catch (error) {

    core.startGroup('Error');

    core.debug(`${stringify(error, { depth: 5 })}`);

    core.endGroup();

    if (error instanceof Error) core.setFailed(error.message)
  }
}

run();
