# --- Build stage ---
FROM maven:3.9.8-eclipse-temurin-17 AS builder
WORKDIR /app

# Create non-root user
RUN groupadd -r maven && useradd -r -g maven maven
RUN chown -R maven:maven /app

USER maven

# Copy pom.xml first for better caching
COPY --chown=maven:maven pom.xml .
COPY --chown=maven:maven src ./src

# Build application
RUN mvn -ntp clean package -DskipTests

# --- Run stage ---
FROM eclipse-temurin:17-jre-alpine

# Install security updates and create non-root user
RUN apk update && apk upgrade && \
    apk add --no-cache tzdata curl && \
    rm -rf /var/cache/apk/* && \
    addgroup -g 1001 -S appuser && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G appuser -g appuser appuser

# Set timezone
ENV TZ=Asia/Ho_Chi_Minh
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

# Copy JAR file
COPY --from=builder --chown=appuser:appuser /app/target/*.jar app.jar

# Create necessary directories with proper permissions
RUN mkdir -p /app/logs && \
    chown -R appuser:appuser /app && \
    chmod -R 755 /app

# Security: Run as non-root user
USER appuser

# Expose port
EXPOSE 8080

# JVM Security Settings
ENV JAVA_OPTS="-Xmx512m -Xms256m \
    -Djava.security.egd=file:/dev/./urandom \
    -Djava.awt.headless=true \
    -XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=75.0 \
    -XX:+UseG1GC \
    -XX:+UseStringDeduplication \
    -Dfile.encoding=UTF-8"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/api/home/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
