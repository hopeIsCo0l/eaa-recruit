package com.eaa.recruit.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(
    name = "availability_slots",
    indexes = {
        @Index(name = "idx_slots_recruiter", columnList = "recruiter_id"),
        @Index(name = "idx_slots_date",      columnList = "slot_date")
    }
)
public class AvailabilitySlot extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recruiter_id", nullable = false, updatable = false)
    private User recruiter;

    @Column(name = "slot_date", nullable = false)
    private LocalDate slotDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "is_booked", nullable = false)
    private boolean booked = false;

    protected AvailabilitySlot() {}

    private AvailabilitySlot(User recruiter, LocalDate slotDate,
                              LocalTime startTime, LocalTime endTime) {
        this.recruiter = recruiter;
        this.slotDate  = slotDate;
        this.startTime = startTime;
        this.endTime   = endTime;
    }

    public static AvailabilitySlot create(User recruiter, LocalDate slotDate,
                                          LocalTime startTime, LocalTime endTime) {
        return new AvailabilitySlot(recruiter, slotDate, startTime, endTime);
    }

    public User      getRecruiter() { return recruiter; }
    public LocalDate getSlotDate()  { return slotDate; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime()   { return endTime; }
    public boolean   isBooked()     { return booked; }

    public void book() { this.booked = true; }
}
