# MLB Contract WAR Calculator (Beta)

**⚠️ BETA VERSION**: This application is in active development. Features may change, and bugs may exist.

A React-based web application that analyzes MLB player contracts and team payrolls from a performance vs. salary perspective.

🔗 **Live Beta**: [https://contract-war-calculator.onrender.com/](https://contract-war-calculator.onrender.com/)

## Beta Features

### Current Functionality
- **WAR Value Calculator**: Analyze individual player contracts using fWAR, bWAR, or average
- **wRC+ Value Calculator**: Convert offensive performance to estimated value
- **Team Analysis**: Evaluate entire team payroll efficiency
- **Position Adjustments**: Compare players to positional averages (new feature)

### Working Features
- ✅ Three calculator modes
- ✅ Example contracts for quick testing
- ✅ Basic calculation history
- ✅ URL parameter sharing
- ✅ Mobile responsive design

### Known Limitations
- 📊 Uses static 2024 league averages (no live data yet)
- 🔍 No player search/autocomplete
- 📈 Single-year analysis only
- 💾 History stored locally only

## Tech Stack
- React 18 + Vite
- Tailwind CSS
- Deployed on Render.com

## Beta Testing

### How to Help
1. Try different player/team calculations
2. Test position-adjusted features
3. Check mobile responsiveness
4. Share calculations via URL

### Report Issues
Please report bugs or suggestions via:
- GitHub Issues: [github.com/harnischllc/badder-calc/issues](https://github.com/harnischllc/badder-calc/issues)
- Email: [contact via BadderSports.com](https://baddersports.com)

## Calculations

**Individual**: Cost per WAR = Salary ÷ WAR  
**Team**: Projected Wins = (Team WAR ÷ 43) × 81  
**Market Rate**: ~$8M per WAR (2024 estimate)

## Roadmap

### Next Updates
- [ ] Live salary/WAR data integration
- [ ] Multi-year contract analysis
- [ ] Player search functionality
- [ ] Historical comparisons

### Future Versions
- Contract predictions
- Trade value calculator
- Expansion to NBA/NFL/NHL

```bash
# Local setup
git clone https://github.com/harnischllc/badder-calc.git
cd badder-calc
npm install
npm run dev

Ownership & Use
This project is developed by Harnisch LLC in partnership with the BadderSports network, including SwingBadder.
All code is © 2024–2025 Harnisch LLC. All rights reserved.
The project is open for public viewing and educational use, but all rights to commercial use, resale, branding, and derivative works remain with Harnisch LLC and BadderSports. Unauthorized use of the SwingBadder or BadderSports names or likenesses is prohibited.
For licensing, contact: eric@ericharnisch.com
Disclaimer
This is a beta tool for entertainment and analysis purposes. Calculations are estimates based on publicly available data and simplified models.

Created for BadderSports.com | @swingbadderpodcast
Version: 0.3.0-beta | Last Updated: July 2025
