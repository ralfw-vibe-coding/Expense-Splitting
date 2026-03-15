Wenn eine Ausgabe hinzugefügt wird, läuft eine Validation, die Eingaben in die Felder überprüft. Es
wird eine Fehlermeldung angezeigt. Super!

Diese Fehlermeldung sollte rot sein und als Toast im Fenster rechts unten angezeigt werden. Sie
verschwindet automatisch nach einer Weile.

---

- Toast ist jetzt rechts unten als “echter” Toast (fixed), mit Ein-/Ausblend-Animation.
- Fehler-Toast ist rot (`toastError()`), Success/Info bleibt neutral (`toast()`); `res.ok === false`
  und Client-Validierung nutzen Fehler-Toast.
