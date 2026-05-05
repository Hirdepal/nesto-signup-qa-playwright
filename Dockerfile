FROM mcr.microsoft.com/playwright:v1.59.1-noble

WORKDIR /app
RUN chown -R pwuser:pwuser /app
USER pwuser

COPY --chown=pwuser:pwuser package*.json ./
RUN npm ci

COPY --chown=pwuser:pwuser . .

ENV CI=true
ENV BASE_URL=https://app.qa.nesto.ca
ENV SIGNUP_EMAIL_DOMAIN=gmail.com
ENV PW_RECORD_ARTIFACTS=false

CMD ["npm", "test"]
