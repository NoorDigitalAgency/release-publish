# Dusk, the release creation action

Used for:
- Creates a new release
- Generates the change log for the release

Usage:
```yaml
    steps:
      - uses: NoorDigitalAgency/dusk@main
        name: Dusk
        with:
          stage: 'alpha' # What stage is the release targeting (alpha, beta and production)
          token: ${{ github.token }} # GitHub token
          artifact_name: dawn-outputs # Artifact name used by dawn
```
