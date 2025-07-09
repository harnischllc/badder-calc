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

## Development

**Note**: This project uses GitHub web UI. Provide copy-paste solutions for contributions.

```bash
# Local setup
git clone https://github.com/harnischllc/badder-calc.git
cd badder-calc
npm install
npm run dev
```

## Disclaimer

This is a beta tool for entertainment and analysis purposes. Calculations are estimates based on publicly available data and simplified models.

---

Created for [BadderSports.com](https://baddersports.com) | [@swingbadderpodcast](https://www.youtube.com/channel/UCvkFXHG5mZyQfsmmf7aU5lQ)

**Version**: 0.3.0-beta | Last Updated: July 2025
