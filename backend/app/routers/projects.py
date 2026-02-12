from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from ..database import get_db
from ..models import (
    Project,
    User,
    UserRole,
    ProjectStatus,
    Milestone,
    MilestoneStatus
)
from ..schemas import ProjectCreate, ProjectResponse
from ..auth import get_current_user
from ..utils.rbac import require_role

router = APIRouter(prefix="/projects", tags=["Projects"])


# =========================================================
# CREATE PROJECT
# =========================================================
@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Only GOVERNMENT users can create projects"""
    require_role([UserRole.GOVERNMENT])(current_user)

    new_project = Project(
        name=project.name,
        description=project.description,
        budget=project.budget,
        creator_id=current_user.id,
        status=ProjectStatus.CREATED
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return new_project


# =========================================================
# GET ALL PROJECTS
# =========================================================
@router.get("/", response_model=List[ProjectResponse])
def get_all_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """All authenticated users can view all projects"""
    return db.query(Project).all()


# =========================================================
# GET MY PROJECTS (GOVERNMENT)
# =========================================================
@router.get("/my-projects", response_model=List[ProjectResponse])
def get_my_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get projects created by current GOVERNMENT user"""
    require_role([UserRole.GOVERNMENT])(current_user)

    return (
        db.query(Project)
        .filter(Project.creator_id == current_user.id)
        .all()
    )


# =========================================================
# FILTER PROJECTS BY STATUS
# =========================================================
@router.get("/filter/by-status", response_model=List[ProjectResponse])
def filter_projects_by_status(
    status: Optional[ProjectStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Filter projects by status"""
    query = db.query(Project)

    if status:
        query = query.filter(Project.status == status)

    return query.all()


# =========================================================
# GET PROJECT BY ID
# =========================================================
@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a project by ID"""
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    return project


# =========================================================
# UPDATE PROJECT STATUS
# =========================================================
@router.put("/{project_id}/status", response_model=ProjectResponse)
def update_project_status(
    project_id: int,
    new_status: ProjectStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Only GOVERNMENT users can update project status"""
    require_role([UserRole.GOVERNMENT])(current_user)

    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    project.status = new_status
    db.commit()
    db.refresh(project)

    return project


# =========================================================
# DELETE PROJECT
# =========================================================
@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Only GOVERNMENT users can delete projects"""
    require_role([UserRole.GOVERNMENT])(current_user)

    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    db.delete(project)
    db.commit()

    return None


# =========================================================
# PROJECT PROGRESS
# =========================================================
@router.get("/{project_id}/progress")
def get_project_progress(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Calculate project progress based on milestones"""
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    total_milestones = db.query(Milestone).filter(
        Milestone.project_id == project_id
    ).count()

    approved_milestones = db.query(Milestone).filter(
        Milestone.project_id == project_id,
        Milestone.status == MilestoneStatus.APPROVED
    ).count()

    pending_milestones = db.query(Milestone).filter(
        Milestone.project_id == project_id,
        Milestone.status == MilestoneStatus.PENDING
    ).count()

    flagged_milestones = db.query(Milestone).filter(
        Milestone.project_id == project_id,
        Milestone.status == MilestoneStatus.FLAGGED
    ).count()

    total_requested = db.query(func.sum(Milestone.requested_amount)).filter(
        Milestone.project_id == project_id
    ).scalar() or 0

    approved_amount = db.query(func.sum(Milestone.requested_amount)).filter(
        Milestone.project_id == project_id,
        Milestone.status == MilestoneStatus.APPROVED
    ).scalar() or 0

    completion_percentage = round(
        (approved_milestones / total_milestones * 100)
        if total_milestones > 0 else 0,
        2
    )

    budget_utilization = round(
        (total_requested / project.budget * 100)
        if project.budget > 0 else 0,
        2
    )

    return {
        "project_id": project_id,
        "project_name": project.name,
        "project_budget": project.budget,
        "project_status": project.status.value,
        "milestones": {
            "total": total_milestones,
            "approved": approved_milestones,
            "pending": pending_milestones,
            "flagged": flagged_milestones
        },
        "funds": {
            "total_requested": total_requested,
            "approved_amount": approved_amount,
            "remaining_budget": project.budget - total_requested
        },
        "progress": {
            "completion_percentage": completion_percentage,
            "budget_utilization": budget_utilization
        }
    }
