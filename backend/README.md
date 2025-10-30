# Init

1. check whether /etc/unikorn/unikorn-backend.ini exists
2. if the .ini file does not exit, create it and its content is:

```
[unikorn]
database_pw=mypass
```

# Run

```
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
````
# Database configuration (separated variables)

Prefer using separated environment variables instead of a single DATABASE_URL:

```
DB_USER=unikorn
DB_PASSWORD=123456
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=unikorn
```

Optional debug & eager test:
```
DB_DEBUG=1       # print masked URL on startup
DB_EAGER_TEST=1  # run SELECT 1 early to surface errors
```

If DATABASE_URL is set it overrides the above. Leave DATABASE_URL unset to rely on separated vars.

Example: copy the sample file
```
cp .env.example .env  # PowerShell: Copy-Item .env.example .env
```
