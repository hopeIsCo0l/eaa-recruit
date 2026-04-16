package com.eaa.recruit.repository;

import com.eaa.recruit.entity.AvailabilitySlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, Long> {

    List<AvailabilitySlot> findByRecruiterIdAndSlotDateGreaterThanEqualOrderBySlotDateAscStartTimeAsc(
            Long recruiterId, LocalDate from);

    @Query("""
            SELECT COUNT(s) > 0 FROM AvailabilitySlot s
            WHERE s.recruiter.id = :recruiterId
              AND s.slotDate     = :slotDate
              AND s.startTime    < :endTime
              AND s.endTime      > :startTime
            """)
    boolean existsOverlap(@Param("recruiterId") Long recruiterId,
                          @Param("slotDate")    LocalDate slotDate,
                          @Param("startTime")   LocalTime startTime,
                          @Param("endTime")     LocalTime endTime);
}
