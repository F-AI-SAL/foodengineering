"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/design-system/Button";
import { Card } from "@/components/design-system/Card";
import { FieldWrapper, Input, Select, Textarea } from "@/components/design-system/Form";

export function ReservationForm() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
    }, 800);
  };

  return (
    <Card
      title="Reserve a Table"
      subtitle="Request a table and receive confirmation once approved."
    >
      <form className="grid gap-md md:grid-cols-2" onSubmit={handleSubmit}>
        <FieldWrapper label="Name">
          <Input placeholder="Full name" required />
        </FieldWrapper>
        <FieldWrapper label="Email">
          <Input type="email" placeholder="you@example.com" required />
        </FieldWrapper>
        <FieldWrapper label="Phone">
          <Input type="tel" placeholder="(555) 000-0000" required />
        </FieldWrapper>
        <FieldWrapper label="Guests">
          <Select required defaultValue="2">
            <option value="2">2 guests</option>
            <option value="4">4 guests</option>
            <option value="6">6 guests</option>
            <option value="8">8 guests</option>
          </Select>
        </FieldWrapper>
        <FieldWrapper label="Date">
          <Input type="date" required />
        </FieldWrapper>
        <FieldWrapper label="Time">
          <Input type="time" required />
        </FieldWrapper>
        <div className="md:col-span-2">
          <FieldWrapper label="Notes" helper="Share seating preferences or allergies.">
            <Textarea placeholder="Let us know anything we should prepare." />
          </FieldWrapper>
        </div>
        <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-sm">
          <p className="text-xs text-muted">Admin confirmation required before final booking.</p>
          <Button type="submit" variant="primary" isLoading={submitting} loadingText="Submitting">
            Request Reservation
          </Button>
        </div>
      </form>
    </Card>
  );
}
