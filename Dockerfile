# syntax=docker/dockerfile:1

# Build ui
FROM --platform=$BUILDPLATFORM node:18.9-alpine3.15 AS ui-builder
WORKDIR /ui
# cache packages in layer
COPY ui/package.json /ui/package.json
COPY ui/package-lock.json /ui/package-lock.json
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci
COPY /ui/. /ui
RUN npm run build


FROM --platform=$BUILDPLATFORM node:21.6.0-alpine3.18
LABEL org.opencontainers.image.title="Log Follower" \
    org.opencontainers.image.description="Follow container logs." \
    org.opencontainers.image.vendor="binginsin" \
    com.docker.desktop.extension.api.version="0.3.4" \
    com.docker.desktop.extension.icon="https://raw.githubusercontent.com/binginsin/LogFollower/main/loglens.svg" \
    com.docker.extension.screenshots='[{"alt":"Filter view", "url":"https://raw.githubusercontent.com/edwin-abraham-thomas/LogLens/main/screenshots/Filter.png"}, {"alt":"Search view", "url":"https://raw.githubusercontent.com/edwin-abraham-thomas/LogLens/main/screenshots/Search.png"}, {"alt":"Logs view", "url":"https://raw.githubusercontent.com/edwin-abraham-thomas/LogLens/main/screenshots/Logs.png"}, {"alt":"Filter view", "url":"https://raw.githubusercontent.com/edwin-abraham-thomas/LogLens/main/screenshots/LogDetails.png"}]' \
    com.docker.extension.detailed-description="Follows logs in a similar fashion to Docker Desktop default implementation" \
    com.docker.extension.publisher-url="https://github.com/binginsin" \
    com.docker.extension.additional-urls="" \
    com.docker.extension.changelog="<p>Extension changelog<ul><li>https://github.com/binginsin/LogFollower?tab=readme-ov-file#changelog</li></ul></p>" \
    com.docker.extension.categories="utility-tools"
COPY metadata.json .
COPY loglens.svg .


# Configure ui
COPY --from=ui-builder /ui/build ui