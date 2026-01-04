"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  MessageCircle, 
  Mail, 
  FileText, 
  Send,
  Book,
  HelpCircle,
  Bug,
  Lightbulb,
  AlertTriangle
} from "lucide-react"

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: "general"
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setSubmitting(false)
    setSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        type: "general"
      })
      setSubmitted(false)
    }, 3000)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Support Center</h1>
        <p className="text-gray-600">Get help with MonitorX platform</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Contact Support
            </h2>
            
            {submitted ? (
              <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-lg text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-semibold mb-2">Message Sent Successfully!</h3>
                <p>We'll get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Name</label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Issue Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="general">General Question</option>
                    <option value="technical">Technical Issue</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="billing">Billing Question</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <Input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Please provide detailed information about your issue..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </Card>
        </div>

        {/* Quick Links & Info */}
        <div className="space-y-6">
          {/* Documentation */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <Book className="h-5 w-5 mr-2" />
              Documentation
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Find answers in our comprehensive documentation
            </p>
            <Button variant="outline" className="w-full">
              Browse Docs
            </Button>
          </Card>

          {/* FAQ */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <HelpCircle className="h-5 w-5 mr-2" />
              FAQ
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Quick answers to common questions
            </p>
            <Button variant="outline" className="w-full">
              View FAQ
            </Button>
          </Card>

          {/* Contact Info */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Contact Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-gray-600">support@monitorx.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">Live Chat</p>
                  <p className="text-gray-600">Available 24/7</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Response Time */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h3 className="font-semibold mb-2">Expected Response Time</h3>
            <p className="text-sm text-gray-600">
              We typically respond within <strong>24 hours</strong> on business days.
            </p>
          </Card>
        </div>
      </div>

      {/* Common Issues */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Common Issues & Solutions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Bug className="h-8 w-8 text-red-500 mb-3" />
            <h3 className="font-semibold mb-2">Website Not Monitoring</h3>
            <p className="text-sm text-gray-600">
              Check if your website URL is correct and accessible. Verify monitoring interval settings.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mb-3" />
            <h3 className="font-semibold mb-2">False Alerts</h3>
            <p className="text-sm text-gray-600">
              Adjust timeout threshold if you're receiving false positive alerts. Consider network conditions.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Lightbulb className="h-8 w-8 text-green-500 mb-3" />
            <h3 className="font-semibold mb-2">Optimize Monitoring</h3>
            <p className="text-sm text-gray-600">
              Set appropriate check intervals based on your needs. More frequent checks use more resources.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
