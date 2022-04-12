# Release Publish Action

Used for:
- Creates a new release
- Generates the change log for the release

Usage:
```yaml
    steps:
      - uses: NoorDigitalAgency/release-publish@main
        name: Release Publish
        with:
          stage: 'alpha' # What stage is the release targeting (alpha, beta and production)
          token: ${{ github.token }} # GitHub token
          artifact_name: release-startup-outputs # Artifact name used by release-startup
```
