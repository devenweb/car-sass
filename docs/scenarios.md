# Operational Daily Scenarios & Solutions
**Royal Car Rental Workflow Guide**

## Group A: Revenue & Pricing Optimization
### 1. High-Duration Discount Request
**Scenario**: A corporate client wants a lower rate for a 15-day rental.
**Solution**: Admin Dashboard -> Edit Model -> Set "Long-Term Discount" to 15% for > 7 days -> Marketplace automatically applies 15% off to Invoice.

### 2. Seasonal Peak Pricing
**Scenario**: You need to increase prices by 20% for the Christmas/New Year week.
**Solution**: Pricing Manager -> Add Date Override -> Dec 20 - Jan 5 -> Set surge rate -> All public cards sync to new rate instantly.

### 3. "Last Minute" Marketing Deals
**Scenario**: You have 3 SUVs sitting idle and want to push them with a discount.
**Solution**: Fleet Manager -> Edit Model -> Add "Marketing Strikethrough Price" -> Set "Limited Time Offer" Tag -> Public card shows prominent Discount Badge.

## Group B: Fleet & Asset Management
### 4. Vehicle Maintenance Offline
**Scenario**: A BMW unit has a flat tire and cannot be rented today.
**Solution**: Admin App -> Fleet -> Units -> Change status to "Maintenance" -> Marketplace instantly hides unit availability.

### 5. Visual Brand Refresh
**Scenario**: You have professional studio photos for the Mercedes and want to show them off.
**Solution**: Vehicle Studio -> Gallery Manager -> Upload 5 HQ Photos -> User sees high-fidelity slideshow on the car detail page.

### 6. Real-time KM & Fleet Health
**Scenario**: Identifying which cars are due for servicing based on usage.
**Solution**: KM Monitoring Module -> Filter by "High Mileage" -> Schedule maintenance for cars exceeding 50,000 km -> Export report for technical team.

### 7. Launching a New Category (e.g., EVs)
**Scenario**: You want to start offering Electric Vehicles as a premium tier.
**Solution**: Fleet Manager -> Create New Model -> Set "Electric" Fuel Type -> Add "Free Charging" to Features -> Instantly appears in "Browse by Category" on Homepage.

## Group C: Logistics & Customer Experience
### 8. Custom Airport Logistics
**Scenario**: A traveler needs a car at SSR Airport with a specific flight arrival.
**Solution**: Booking Form -> Select "Airport" Location -> Enter Flight Code in Address field -> Admin receives notification in Inquiries.

### 9. Expanding Service Offerings (Extras)
**Scenario**: You want to start offering "Baby Seats" or "Meet & Greet" as paid add-ons.
**Solution**: Extras Manager -> Add "Baby Seat" -> Set 500 Rs/Day -> Appears as a selectable option in the checkout flow.

### 10. VIP Personalized Quoting
**Scenario**: A returning VIP customer requests a one-off special rate.
**Solution**: Customer CRM -> View History -> Admin App -> Create a Manual Rental -> Apply custom subtotal override -> Send PDF Invoice.

## Group D: Operations & Communications
### 11. Crisis Message Management
**Scenario**: 50 inquiries come in during a holiday weekend.
**Solution**: Inquiries Module -> Bulk Selection -> Change status to "Replied" -> Centralized tracking of all customer touchpoints.

### 12. High-Volume "Sold Out" Status
**Scenario**: Handling a total fleet sell-out during a major festival.
**Solution**: Fleet Manager -> Units -> Bulk Set Status to "Rented" -> Marketplace automatically displays "ALL UNITS RENTED OUT" badges to manage expectations.

## Group E: Serious Risk & Damage Management
### 13. Reckless Driving / Excessive Speeding
**Scenario**: Customer drives the car aggressively, ignoring mechanical limits.
**Solution**: KM Monitoring -> Check mileage/tire wear post-rental -> Note "Aggressive Usage" in Customer Profile -> **Blacklist customer** from future bookings.

### 14. Major Accident / Total Loss
**Scenario**: A vehicle is involved in a severe crash.
**Solution**: Rentals Dashboard -> Change Status to "Accident" -> Upload Police Report to Rental Files -> Trigger Insurance Claims -> Set Plate to "Total Loss".

### 15. Interior Vandalism (Smoking/Stains)
**Scenario**: Customer returns a luxury car smelling of smoke or with deep seat stains.
**Solution**: Inspections Module -> Photo Evidence -> Add "Deep Cleaning Fee" (e.g., 5000 Rs) to Invoice -> Deduct from Security Deposit.

### 16. Off-Road Violation (Sand/Beach)
**Scenario**: Driving a 2WD sedan on prohibited sandy terrain, causing undercarriage damage.
**Solution**: Post-Rental Inspection -> Log "Terrain Violation" -> Add Mechanical Repair Penalty -> Log violation against the Driver's License in CRM.

### 17. Drunk Driving / Police Impoundment
**Scenario**: Vehicle is seized by authorities due to driver negligence.
**Solution**: Admin App -> Rental Immediate Termination -> Flag profile as **"High Risk / Legal Issue"** -> Notify Legal Team via CRM internal notes.

### 18. Late Return / "Ghosting"
**Scenario**: Customer doesn't return the car on time and stops answering calls.
**Solution**: Rentals Dashboard -> Auto-flag "Overdue" -> Enable "Hourly Penalty" calculation -> Initiate "Theft Protocol" after 24 hours of silence.

### 19. Unauthorized Driver Accident
**Scenario**: An unlisted friend of the customer crashes the car.
**Solution**: Compare Accident Report vs Rental Agreement -> Deny insurance coverage -> Log "Contract Breach" -> Pursuit of full recovery from the primary hirer.

---

### **Final System Maturity Rating**
# **9.9 / 10** 
*A fortress of a system, designed to protect agency assets from reckless usage and legal liabilities.*
