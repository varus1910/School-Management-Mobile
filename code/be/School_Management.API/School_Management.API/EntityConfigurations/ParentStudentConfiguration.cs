using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class ParentStudentConfiguration : IEntityTypeConfiguration<ParentStudent>
    {
        public void Configure(EntityTypeBuilder<ParentStudent> builder)
        {
            builder.HasIndex(x => new { x.ParentId, x.StudentId }).IsUnique();
            builder.Property(x => x.ParentId).IsRequired();
            builder.Property(x => x.StudentId).IsRequired();
            builder.Property(x => x.Relationship).HasMaxLength(50);
        }
    }
}
