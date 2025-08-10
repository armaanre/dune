# syntax=docker/dockerfile:1

FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod ./
COPY go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server .

FROM alpine:3.19
RUN adduser -D -H app && apk add --no-cache ca-certificates
USER app
WORKDIR /home/app
COPY --from=builder /app/server ./server
ENV PORT=8080
EXPOSE 8080
CMD ["./server"]
