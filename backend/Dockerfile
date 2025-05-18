FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

ENV TZ=Asia/Ho_Chi_Minh
RUN apk add --no-cache tzdata

EXPOSE 9000
ENTRYPOINT ["java", "-jar", "app.jar"]