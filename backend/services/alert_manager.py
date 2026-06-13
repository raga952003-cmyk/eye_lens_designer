import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from twilio.rest import Client as TwilioClient
from sqlalchemy.orm import Session
from models import AlertLog, AlertChannel, Order
from datetime import datetime
from typing import List
import random

class AlertManager:
    def __init__(self, db: Session):
        self.db = db
        # Twilio Client Initialization
        self.twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.twilio_from = os.getenv("TWILIO_WHATSAPP_FROM")
        self.twilio_recipient = os.getenv("ALERT_RECIPIENT_WHATSAPP")

        # SMTP Client Configuration
        self.smtp_host = os.getenv("SMTP_HOST")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))
        self.smtp_user = os.getenv("SMTP_USERNAME")
        self.smtp_pass = os.getenv("SMTP_PASSWORD")
        self.smtp_from = os.getenv("SMTP_FROM_EMAIL")
        self.email_recipient = os.getenv("ALERT_RECIPIENT_EMAIL")
    
    def generate_alert(self, order: Order, channel: AlertChannel = None) -> AlertLog:
        """Create alert entry and dispatch real email or WhatsApp message"""
        # Generate unique alert ID
        count = self.db.query(AlertLog).count()
        alert_id = f"ALT-{str(count + 1).zfill(3)}"
        
        # Select channel if not provided
        if not channel:
            channel = AlertChannel.WHATSAPP if random.random() > 0.5 else AlertChannel.EMAIL
        
        # Format alert message
        message = self.format_alert_message(order)
        
        # --- DISPATCH LOGIC ---
        success = False
        bypass_reason = None
        
        if channel == AlertChannel.EMAIL:
            if not all([self.smtp_host, self.smtp_user, self.smtp_pass, self.email_recipient]):
                bypass_reason = "SMTP configurations missing"
            else:
                success = self.send_real_email(subject=f"OMS High Risk Alert: Order {order.id}", body=message)
                if not success:
                    bypass_reason = "SMTP send failed"
        elif channel == AlertChannel.WHATSAPP:
            if not all([self.twilio_sid, self.twilio_token, self.twilio_from, self.twilio_recipient]):
                bypass_reason = "Twilio credentials missing"
            else:
                success = self.send_real_whatsapp(body=message)
                if not success:
                    bypass_reason = "Twilio dispatch failed"

        status_text = ""
        if success:
            status_text = " [SENT]"
        elif bypass_reason:
            status_text = f" [BYPASSED: {bypass_reason}]"
        else:
            status_text = " [DISPATCH FAILED]"

        alert = AlertLog(
            id=alert_id,
            order_id=order.id,
            customer_name=order.customer_name,
            risk_score=order.breach_probability,
            channel=channel,
            message=message + status_text,
            sent_at=datetime.now()
        )
        
        self.db.add(alert)
        self.db.commit()
        self.db.refresh(alert)
        
        return alert

    def send_real_email(self, subject: str, body: str) -> bool:
        """Helper to send email alert via SMTP"""
        try:
            msg = MIMEMultipart()
            msg['From'] = self.smtp_from
            msg['To'] = self.email_recipient
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain'))
            
            server = smtplib.SMTP(self.smtp_host, self.smtp_port)
            server.starttls()
            server.login(self.smtp_user, self.smtp_pass)
            server.sendmail(self.smtp_from, self.email_recipient, msg.as_string())
            server.close()
            return True
        except Exception as e:
            print(f"SMTP Alert Dispatch Failure: {e}")
            return False

    def send_real_whatsapp(self, body: str) -> bool:
        """Helper to send WhatsApp alert via Twilio REST API"""
        try:
            client = TwilioClient(self.twilio_sid, self.twilio_token)
            client.messages.create(
                body=body,
                from_=self.twilio_from,
                to=self.twilio_recipient
            )
            return True
        except Exception as e:
            print(f"Twilio WhatsApp Dispatch Failure: {e}")
            return False

    
    def format_alert_message(self, order: Order) -> str:
        """Format alert notification text"""
        if order.breach_probability == 100:
            emoji = "🚨"
            severity = "CRITICAL SLA BREACH"
        elif order.breach_probability > 70:
            emoji = "⚠️"
            severity = "HIGH RISK ALERT"
        else:
            emoji = "⚡"
            severity = "ELEVATED RISK"
        
        delay_info = ""
        if order.delay_reason:
            delay_info = f" Delay reason: {order.delay_reason}."
        
        message = (
            f"{emoji} {severity}: Order {order.id} for {order.customer_name} "
            f"has {order.breach_probability}% breach probability. "
            f"Current stage: {order.current_stage}. "
            f"Stock status: {order.stock_status}.{delay_info}"
        )
        
        return message
    
    def get_all_alerts(self) -> List[AlertLog]:
        """Retrieve all alert log entries ordered by sent_at descending"""
        return self.db.query(AlertLog).order_by(AlertLog.sent_at.desc()).all()
