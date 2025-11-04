# --- Build stage ---
FROM maven:3.9.8-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -ntp clean package -DskipTests

# --- Run stage ---
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
ENV TZ=Asia/Ho_Chi_Minh
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
