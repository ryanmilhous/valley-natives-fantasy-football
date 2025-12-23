# How to Get Your ESPN Cookies

Since your league is private, you need to provide authentication cookies to access the data. Follow these steps:

## Step-by-Step Instructions

### For Chrome:
1. Go to https://fantasy.espn.com/football and log in
2. Press `F12` to open Developer Tools (or right-click anywhere and select "Inspect")
3. Click on the **Application** tab (might be hidden under >> if your window is narrow)
4. In the left sidebar, expand **Cookies** and click on `https://fantasy.espn.com`
5. Find and copy the values for:
   - **espn_s2**: A very long string (looks like: `AEBxxx...`)
   - **SWID**: Format is `{XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX}` (includes the curly braces)

### For Firefox:
1. Go to https://fantasy.espn.com/football and log in
2. Press `F12` to open Developer Tools
3. Click on the **Storage** tab
4. In the left sidebar, expand **Cookies** and click on `https://fantasy.espn.com`
5. Find and copy the values for:
   - **espn_s2**: A very long string
   - **SWID**: Format is `{XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX}`

### For Safari:
1. First, enable the Develop menu: Safari > Preferences > Advanced > Check "Show Develop menu in menu bar"
2. Go to https://fantasy.espn.com/football and log in
3. Press `Option + Command + C` to open Web Inspector
4. Click on the **Storage** tab
5. Click on **Cookies** in the left sidebar
6. Find and copy the values for:
   - **espn_s2**: A very long string
   - **SWID**: Format is `{XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX}`

## Adding Cookies to Your Configuration

1. Copy the `backend/.env.template` file to `backend/.env`:
   ```bash
   cp backend/.env.template backend/.env
   ```

2. Open `backend/.env` in a text editor

3. Paste your cookie values:
   ```
   ESPN_LEAGUE_ID=380405
   ESPN_S2=AEBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ESPN_SWID={XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX}
   ```

4. Save the file

## Important Notes

- **Keep these cookies private!** They give access to your ESPN account. Never commit the `.env` file to version control.
- Cookies may expire after some time. If you start getting authentication errors, just repeat this process to get fresh cookies.
- The `.gitignore` file is configured to exclude `.env` from git to protect your credentials.

## Troubleshooting

If you're getting authentication errors:
- Make sure you copied the entire cookie value (espn_s2 is very long)
- Include the curly braces `{}` in the SWID value
- Try logging out and back into ESPN, then getting fresh cookies
- Make sure there are no extra spaces or quotes around the values in your `.env` file
